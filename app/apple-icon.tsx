import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #eef5e4 0%, #dce9cc 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 72,
            height: 112,
            borderRadius: 999,
            background: "#fffaf0",
            border: "8px solid #5a8a4e",
          }}
        />
      </div>
    ),
    size,
  );
}
