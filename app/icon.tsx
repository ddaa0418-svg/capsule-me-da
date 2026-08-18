import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8f1dc",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 18,
            height: 26,
            borderRadius: 999,
            background: "#fffaf0",
            border: "3px solid #5a8a4e",
          }}
        />
      </div>
    ),
    size,
  );
}
