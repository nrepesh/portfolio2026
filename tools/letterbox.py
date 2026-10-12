#!/usr/bin/env python3
"""
letterbox.py -- pure-stdlib PNG letterboxer.

Decodes 8-bit PNG (colour types 0/2/4/6, non-interlaced), flattens alpha onto a
dark canvas, area-averages (box filter) down to a fit-inside size, centres it on
a fixed canvas with padding, draws a 1px hairline around the placed region and
re-encodes as an 8-bit RGB PNG with adaptive scanline filtering + zlib level 9.

Fails loudly on PNG variants that are not implemented (palette, 16-bit,
interlaced) rather than emitting something silently wrong.

Usage:
    python3 letterbox.py            # runs the built-in job table
"""

import os
import struct
import sys
import zlib
from array import array

PNG_SIG = b"\x89PNG\r\n\x1a\n"


# --------------------------------------------------------------------------
# Decoding
# --------------------------------------------------------------------------

def _iter_chunks(data, path):
    if data[:8] != PNG_SIG:
        raise ValueError("%s: not a PNG (bad signature)" % path)
    off = 8
    n = len(data)
    while off + 8 <= n:
        (length,) = struct.unpack(">I", data[off:off + 4])
        ctype = data[off + 4:off + 8]
        payload = data[off + 8:off + 8 + length]
        if len(payload) != length:
            raise ValueError("%s: truncated chunk %r" % (path, ctype))
        yield ctype, payload
        off += 12 + length


def _paeth(a, b, c):
    p = a + b - c
    pa = p - a
    if pa < 0:
        pa = -pa
    pb = p - b
    if pb < 0:
        pb = -pb
    pc = p - c
    if pc < 0:
        pc = -pc
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def decode_png(path):
    """Return (width, height, channels, rows) where rows is a list of bytearray
    scanlines of `channels` 8-bit samples per pixel."""
    with open(path, "rb") as fh:
        data = fh.read()

    width = height = depth = ctype = interlace = None
    idat = []
    for name, payload in _iter_chunks(data, path):
        if name == b"IHDR":
            width, height, depth, ctype, comp, filt, interlace = struct.unpack(
                ">IIBBBBB", payload[:13])
            if depth != 8:
                raise NotImplementedError(
                    "%s: bit depth %d not implemented (only 8-bit)" % (path, depth))
            if ctype == 3:
                raise NotImplementedError(
                    "%s: palette PNG (colour type 3) not implemented" % path)
            if ctype not in (0, 2, 4, 6):
                raise NotImplementedError(
                    "%s: colour type %d not implemented" % (path, ctype))
            if comp != 0 or filt != 0:
                raise NotImplementedError(
                    "%s: compression=%d filter-method=%d not implemented"
                    % (path, comp, filt))
            if interlace != 0:
                raise NotImplementedError(
                    "%s: interlaced (Adam7) PNG not implemented" % path)
        elif name == b"IDAT":
            idat.append(payload)
        elif name == b"IEND":
            break

    if width is None:
        raise ValueError("%s: no IHDR chunk" % path)
    if not idat:
        raise ValueError("%s: no IDAT data" % path)

    channels = {0: 1, 2: 3, 4: 2, 6: 4}[ctype]
    raw = zlib.decompress(b"".join(idat))
    stride = width * channels
    expect = (stride + 1) * height
    if len(raw) != expect:
        raise ValueError("%s: decompressed size %d != expected %d"
                         % (path, len(raw), expect))

    rows = []
    prev = bytearray(stride)
    bpp = channels
    pos = 0
    for _y in range(height):
        ftype = raw[pos]
        pos += 1
        cur = bytearray(raw[pos:pos + stride])
        pos += stride
        if ftype == 0:
            pass
        elif ftype == 1:  # Sub
            for i in range(bpp, stride):
                cur[i] = (cur[i] + cur[i - bpp]) & 0xFF
        elif ftype == 2:  # Up
            cur = bytearray((a + b) & 0xFF for a, b in zip(cur, prev))
        elif ftype == 3:  # Average
            for i in range(stride):
                left = cur[i - bpp] if i >= bpp else 0
                cur[i] = (cur[i] + ((left + prev[i]) >> 1)) & 0xFF
        elif ftype == 4:  # Paeth
            for i in range(stride):
                if i >= bpp:
                    left = cur[i - bpp]
                    upleft = prev[i - bpp]
                else:
                    left = 0
                    upleft = 0
                cur[i] = (cur[i] + _paeth(left, prev[i], upleft)) & 0xFF
        else:
            raise ValueError("%s: unknown scanline filter type %d" % (path, ftype))
        rows.append(cur)
        prev = cur

    return width, height, channels, rows


# --------------------------------------------------------------------------
# Alpha flatten -> float RGB rows
# --------------------------------------------------------------------------

def flatten_rows(width, height, channels, rows, bg):
    """Composite onto bg (r,g,b) and return list of array('f') RGB rows."""
    br, bg_, bb = bg
    out = []
    for row in rows:
        vals = array('f', bytes(width * 12))
        if channels == 4:
            i = 0
            for x in range(width):
                a = row[i + 3]
                if a == 255:
                    vals[x * 3] = row[i]
                    vals[x * 3 + 1] = row[i + 1]
                    vals[x * 3 + 2] = row[i + 2]
                else:
                    f = a / 255.0
                    g = 1.0 - f
                    vals[x * 3] = row[i] * f + br * g
                    vals[x * 3 + 1] = row[i + 1] * f + bg_ * g
                    vals[x * 3 + 2] = row[i + 2] * f + bb * g
                i += 4
        elif channels == 3:
            for x in range(width):
                vals[x * 3] = row[x * 3]
                vals[x * 3 + 1] = row[x * 3 + 1]
                vals[x * 3 + 2] = row[x * 3 + 2]
        elif channels == 2:
            for x in range(width):
                v = row[x * 2]
                a = row[x * 2 + 1]
                f = a / 255.0
                g = 1.0 - f
                vals[x * 3] = v * f + br * g
                vals[x * 3 + 1] = v * f + bg_ * g
                vals[x * 3 + 2] = v * f + bb * g
        else:  # grayscale
            for x in range(width):
                v = row[x]
                vals[x * 3] = v
                vals[x * 3 + 1] = v
                vals[x * 3 + 2] = v
        out.append(vals)
    return out


# --------------------------------------------------------------------------
# Area-average (box) resampling, separable
# --------------------------------------------------------------------------

def axis_coverage(src_n, dst_n):
    """For each destination index, the list of (src_index, normalised weight)
    covering it -- a true area/box average over the source pixels."""
    scale = src_n / float(dst_n)
    cov = []
    for d in range(dst_n):
        s0 = d * scale
        s1 = s0 + scale
        i0 = int(s0)
        i1 = int(s1)
        if i1 >= src_n:
            i1 = src_n - 1
        parts = []
        total = 0.0
        for s in range(i0, i1 + 1):
            lo = s if s > s0 else s0
            hi = (s + 1) if (s + 1) < s1 else s1
            w = hi - lo
            if w <= 0:
                continue
            parts.append((s, w))
            total += w
        if not parts:
            parts = [(min(i0, src_n - 1), 1.0)]
            total = 1.0
        cov.append([(s, w / total) for s, w in parts])
    return cov


def resample(rgb_rows, sw, sh, dw, dh):
    """Box/area-average resample. rgb_rows: list of array('f') length sw*3."""
    # Vertical pass first (collapses row count early).
    cov_y = axis_coverage(sh, dh)
    vpass = []
    n = sw * 3
    for dy in range(dh):
        parts = cov_y[dy]
        s, w = parts[0]
        src = rgb_rows[s]
        acc = [v * w for v in src]
        for s, w in parts[1:]:
            src = rgb_rows[s]
            acc = [a + b * w for a, b in zip(acc, src)]
        vpass.append(acc)

    # Horizontal pass.
    cov_x = axis_coverage(sw, dw)
    out = []
    for dy in range(dh):
        src = vpass[dy]
        row = bytearray(dw * 3)
        o = 0
        for dx in range(dw):
            parts = cov_x[dx]
            r = g = b = 0.0
            for s, w in parts:
                i = s * 3
                r += src[i] * w
                g += src[i + 1] * w
                b += src[i + 2] * w
            r = int(r + 0.5)
            g = int(g + 0.5)
            b = int(b + 0.5)
            row[o] = 0 if r < 0 else (255 if r > 255 else r)
            row[o + 1] = 0 if g < 0 else (255 if g > 255 else g)
            row[o + 2] = 0 if b < 0 else (255 if b > 255 else b)
            o += 3
        out.append(row)
    return out


# --------------------------------------------------------------------------
# Encoding
# --------------------------------------------------------------------------

def _chunk(name, payload):
    return (struct.pack(">I", len(payload)) + name + payload
            + struct.pack(">I", zlib.crc32(name + payload) & 0xFFFFFFFF))


def _filter_row(cur, prev, bpp):
    """Adaptive filtering: try all five, keep the one with the smallest sum of
    absolute signed deviations (the standard libpng heuristic)."""
    n = len(cur)
    best = None
    best_score = None

    cands = []
    # 0: None
    cands.append((0, bytes(cur)))
    # 1: Sub
    sub = bytearray(n)
    for i in range(bpp):
        sub[i] = cur[i]
    for i in range(bpp, n):
        sub[i] = (cur[i] - cur[i - bpp]) & 0xFF
    cands.append((1, bytes(sub)))
    # 2: Up
    up = bytearray((a - b) & 0xFF for a, b in zip(cur, prev))
    cands.append((2, bytes(up)))
    # 3: Average
    avg = bytearray(n)
    for i in range(n):
        left = cur[i - bpp] if i >= bpp else 0
        avg[i] = (cur[i] - ((left + prev[i]) >> 1)) & 0xFF
    cands.append((3, bytes(avg)))
    # 4: Paeth
    pae = bytearray(n)
    for i in range(n):
        if i >= bpp:
            left = cur[i - bpp]
            upleft = prev[i - bpp]
        else:
            left = 0
            upleft = 0
        pae[i] = (cur[i] - _paeth(left, prev[i], upleft)) & 0xFF
    cands.append((4, bytes(pae)))

    for ftype, buf in cands:
        score = 0
        for v in buf:
            score += v if v < 128 else 256 - v
        if best_score is None or score < best_score:
            best_score = score
            best = (ftype, buf)
    return best


def encode_png(path, width, height, rows):
    raw = bytearray()
    stride = width * 3
    prev = bytearray(stride)
    for row in rows:
        if len(row) != stride:
            raise ValueError("row length %d != stride %d" % (len(row), stride))
        ftype, buf = _filter_row(row, prev, 3)
        raw.append(ftype)
        raw += buf
        prev = row
    raw = bytes(raw)
    best = None
    for strategy in (zlib.Z_DEFAULT_STRATEGY, zlib.Z_FILTERED, zlib.Z_RLE):
        co = zlib.compressobj(9, zlib.DEFLATED, 15, 9, strategy)
        blob = co.compress(raw) + co.flush()
        if best is None or len(blob) < len(best):
            best = blob
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    body = (PNG_SIG + _chunk(b"IHDR", ihdr)
            + _chunk(b"IDAT", best)
            + _chunk(b"IEND", b""))
    with open(path, "wb") as fh:
        fh.write(body)
    return len(body)


# --------------------------------------------------------------------------
# Composition
# --------------------------------------------------------------------------

def make_canvas(cw, ch, bg):
    r, g, b = bg
    row_proto = bytes((r, g, b)) * cw
    return [bytearray(row_proto) for _ in range(ch)]


def letterbox(src, dst, cw, ch, bg=(0x11, 0x11, 0x18),
              hairline=(0x1E, 0x1E, 0x2E), pad_frac=0.035, allow_upscale=False,
              crop=None, patches=None, fills=None):
    sw, sh, channels, rows = decode_png(src)
    rgb = flatten_rows(sw, sh, channels, rows, bg)
    del rows

    # Cover UI chrome by copying an equal-sized clean region over it.
    # Each patch is (dst_x, dst_y, w, h, src_x, src_y) in ORIGINAL source pixels.
    # Copy from the same rows where possible so a vertical gradient stays continuous.
    # Rows are array('f') indexed per COMPONENT (3 floats per pixel), not bytes.
    for (dx, dy, pw, ph, sx, sy) in (patches or []):
        for i in range(ph):
            srow = rgb[sy + i]
            drow = rgb[dy + i]
            drow[dx * 3:(dx + pw) * 3] = srow[sx * 3:(sx + pw) * 3]

    # Inpaint a rectangle by interpolating each row between its own true left and
    # right neighbours. Both vertical edges stay exactly continuous, so on smooth
    # content (sky) the repair is seamless. Each entry is (x, y, w, h).
    # `feather` rows at the top and bottom cross-fade back to the untouched
    # pixels, so the repair has no hard horizontal seam.
    for (fx, fy, fw, fh, feather) in (fills or []):
        lx, rx = fx - 1, fx + fw
        for k in range(fh):
            y = fy + k
            row = rgb[y]
            if feather > 0:
                edge = min(k, fh - 1 - k)
                blend = 1.0 if edge >= feather else (edge + 1) / float(feather + 1)
            else:
                blend = 1.0
            for c in range(3):
                a = row[lx * 3 + c]
                b = row[rx * 3 + c]
                step = (b - a) / float(fw + 1)
                for j in range(fw):
                    idx = (fx + j) * 3 + c
                    val = a + step * (j + 1)
                    row[idx] = val * blend + row[idx] * (1.0 - blend)

    # Optional source crop (x0, y0, x1, y1), applied before resampling so the
    # discarded region costs nothing in the output.
    if crop is not None:
        cx0, cy0, cx1, cy1 = crop
        cx0 = max(0, min(cx0, sw))
        cy0 = max(0, min(cy0, sh))
        cx1 = max(cx0 + 1, min(cx1, sw))
        cy1 = max(cy0 + 1, min(cy1, sh))
        rgb = [row[cx0 * 3:cx1 * 3] for row in rgb[cy0:cy1]]
        sw, sh = cx1 - cx0, cy1 - cy0

    pad_x = int(round(cw * pad_frac))
    pad_y = int(round(ch * pad_frac))
    inner_w = cw - 2 * pad_x
    inner_h = ch - 2 * pad_y
    scale = min(inner_w / float(sw), inner_h / float(sh))
    if not allow_upscale and scale > 1.0:
        scale = 1.0
    dw = max(1, int(round(sw * scale)))
    dh = max(1, int(round(sh * scale)))
    if dw > inner_w:
        dw = inner_w
    if dh > inner_h:
        dh = inner_h

    small = resample(rgb, sw, sh, dw, dh)
    del rgb

    canvas = make_canvas(cw, ch, bg)
    ox = (cw - dw) // 2
    oy = (ch - dh) // 2
    for y in range(dh):
        canvas[oy + y][ox * 3:(ox + dw) * 3] = small[y]

    # 1px hairline just OUTSIDE the placed region (never covers image pixels).
    hr = bytes(hairline)
    x0, y0 = ox - 1, oy - 1
    x1, y1 = ox + dw, oy + dh
    for x in range(max(x0, 0), min(x1, cw - 1) + 1):
        if 0 <= y0 < ch:
            canvas[y0][x * 3:x * 3 + 3] = hr
        if 0 <= y1 < ch:
            canvas[y1][x * 3:x * 3 + 3] = hr
    for y in range(max(y0, 0), min(y1, ch - 1) + 1):
        if 0 <= x0 < cw:
            canvas[y][x0 * 3:x0 * 3 + 3] = hr
        if 0 <= x1 < cw:
            canvas[y][x1 * 3:x1 * 3 + 3] = hr

    size = encode_png(dst, cw, ch, canvas)
    return dict(src=src, dst=dst, src_w=sw, src_h=sh, canvas=(cw, ch),
                placed=(dw, dh), offset=(ox, oy), bytes=size)


# --------------------------------------------------------------------------
# Job table
# --------------------------------------------------------------------------

# Sources live in the private OMSCS course repo, which is NOT part of this repo
# and is only ever read. Point RAIT_PROJECTS at your local clone, e.g.
#   RAIT_PROJECTS=~/github/omscs-rait-summer2026/Projects python3 tools/letterbox.py
SRC_ROOT = os.path.expanduser(os.environ.get(
    "RAIT_PROJECTS", "~/github/omscs-rait-summer2026/Projects"))

# Outputs land in this repo's images/ dir, resolved relative to this file so the
# script works from any cwd.
OUT_ROOT = os.environ.get("PORTFOLIO_IMAGES") or os.path.join(
    os.path.dirname(os.path.abspath(__file__)), os.pardir, "images")

# (src, dst, canvas_w, canvas_h[, crop]) -- crop is (x0, y0, x1, y1) in source px.
#
# Two sources are cropped deliberately, not for framing:
#   P1: the top strip carries the simulator's "Test Case: 18" label. Course test
#       cases are GT property, so the strip is cut. The world frame, its axis
#       labels and the timestep counter all survive.
#   P3: the telemetry overlay prints the TUNED PID GAIN VALUES, which are
#       solution data and must not be published. Cropping to the square flight
#       view removes them, and as a side effect drops the file from 404 KB to
#       ~229 KB by discarding photo pixels.
JOBS = [
    dict(src="Hopscotch_ Kalman Filters/P1_sample_photo.png", dst="rait-kalman.png",
         cw=960, ch=540, crop=(0, 44, 672, 680)),
    dict(src="Solar System_ Particle Filters/P2_sample_photo.png", dst="rait-particle.png",
         cw=960, ch=540),
    # NOTE: this one is a photograph - 118k unique colours - so the PNG this
    # tool writes is converted to images/rait-pid.jpg afterwards (343 KB -> 54 KB)
    # and that JPEG is what the site references. This tool is a PNG encoder by
    # design; re-run it, then re-convert. The other thumbnails are flat UI
    # screenshots where PNG is the right format and no conversion is wanted.
    dict(src="Drone Control_ PID/P3_sample_photo.png", dst="rait-pid.png",
         cw=960, ch=540, crop=(0, 0, 499, 499), allow_upscale=True,
         fills=[(345, 84, 150, 60, 14)]),
    dict(src="Path Search/P4_sample_photo.png", dst="rait-pathsearch.png",
         cw=960, ch=540),
    dict(src="Policy Search/P5_sample_photo.png", dst="rait-policysearch.png",
         cw=960, ch=540),
    dict(src="Indiana Drones_ SLAM/P6_sample_photo.png", dst="rait-slam.png",
         cw=960, ch=540),
    dict(src="Drone Control_ PID/P3_graph.png", dst="rait-pid-response.png",
         cw=1000, ch=1000),
]


def main():
    if not os.path.isdir(SRC_ROOT):
        sys.exit("source dir not found: %s\nSet RAIT_PROJECTS to your local clone "
                 "of the OMSCS course repo." % SRC_ROOT)
    for job in JOBS:
        src = os.path.join(SRC_ROOT, job["src"])
        dst = os.path.join(OUT_ROOT, job["dst"])
        info = letterbox(src, dst, job["cw"], job["ch"],
                         crop=job.get("crop"), fills=job.get("fills"),
                         allow_upscale=job.get("allow_upscale", False))
        print("%-24s %sx%s canvas, placed %sx%s at %s, %.1f KB" % (
            job["dst"], info["canvas"][0], info["canvas"][1],
            info["placed"][0], info["placed"][1], info["offset"],
            info["bytes"] / 1024.0))
        sys.stdout.flush()


if __name__ == "__main__":
    main()
