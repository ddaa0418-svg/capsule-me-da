import { ImageResponse } from "next/og";
import { getSiteUrl, siteConfig } from "@/lib/site";
import { loadGoogleFont } from "@/lib/og-font";

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = "image/png";

type OgImageOptions = {
  title?: string;
  description?: string;
  kicker?: string;
};

export async function createOgImage({
  title = siteConfig.name,
  description = siteConfig.description,
  kicker = "FOREST CAPSULE",
}: OgImageOptions = {}) {
  const host = new URL(getSiteUrl()).host;
  const fontText = `${kicker}${title}${description}${host}`;
  const [regular, bold] = await Promise.all([
    loadGoogleFont("Noto Sans KR", 400, fontText),
    loadGoogleFont("Noto Sans KR", 700, fontText),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #eef5e4 0%, #dce9cc 48%, #e6dcc4 100%)",
          color: "#243528",
          fontFamily: '"Noto Sans KR"',
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 720,
            height: 420,
            top: -80,
            left: 180,
            borderRadius: 999,
            background: "rgba(168, 196, 122, 0.35)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 420,
            height: 280,
            right: -40,
            bottom: -40,
            borderRadius: 999,
            background: "rgba(196, 160, 106, 0.22)",
          }}
        />
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "56px 64px",
          }}
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "48px 56px",
              borderRadius: 48,
              border: "1px solid rgba(255, 250, 240, 0.7)",
              background: "rgba(255, 253, 246, 0.86)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                width: 640,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.28em",
                  color: "#6b4f32",
                }}
              >
                {kicker}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: title.length > 8 ? 72 : 96,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    display: "flex",
                    maxWidth: 620,
                    fontSize: 30,
                    lineHeight: 1.45,
                    color: "#4a5c48",
                    fontWeight: 400,
                  }}
                >
                  {description}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  color: "#6b4f32",
                  fontWeight: 400,
                }}
              >
                {host}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 280,
                height: 360,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 240,
                  height: 240,
                  borderRadius: 999,
                  background: "rgba(183, 201, 161, 0.45)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 86,
                      height: 42,
                      borderRadius: 18,
                      background: "#F0E0C4",
                      border: "4px solid #c9b089",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      position: "relative",
                      width: 92,
                      height: 168,
                      marginTop: -8,
                      borderRadius: 36,
                      background: "linear-gradient(180deg, #E6C8A0 0%, #8B5A36 100%)",
                      border: "4px solid rgba(107, 79, 50, 0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        position: "absolute",
                        right: 18,
                        bottom: 42,
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: "#6F8F4A",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Noto Sans KR", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
