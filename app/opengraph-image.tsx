import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          gap: 24,
          background: "#0e1012",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#007afc", textTransform: "uppercase" }}>
          AreaVon
        </div>
        <div style={{ fontSize: 56, fontWeight: 700, textAlign: "center", lineHeight: 1.15 }}>
          Encontre empresas com website não encontrado na fonte consultada
        </div>
        <div style={{ fontSize: 26, color: "#a0aaba", textAlign: "center" }}>
          Prospecção comercial determinística — sem IA
        </div>
      </div>
    ),
    { ...size },
  );
}
