import { ImageResponse } from "next/og";

export const alt = "WareBase — Every item, in its place.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #ffffff 0%, #F4F2FB 40%, #F0EDF8 70%, #F3F0FA 100%)",
          color: "#151F38",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "linear-gradient(135deg, #22345C 0%, #151F38 100%)",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            Ware<span style={{ color: "#E8A23D" }}>Base</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: -1.5,
            textAlign: "center",
          }}
        >
          Every item, in its place.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 26,
            color: "#5B6B79",
            textAlign: "center",
            maxWidth: 720,
            lineHeight: 1.4,
          }}
        >
          Real-time stock tracking, intelligent purchasing, approvals, and warehouse control — all in one
          elegant platform.
        </div>
      </div>
    ),
    size,
  );
}
