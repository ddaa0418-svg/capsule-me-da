export async function loadGoogleFont(family: string, weight: number, text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load font CSS");
    }

    return response.text();
  });

  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);

  if (!match?.[1]) {
    throw new Error("Failed to parse font file URL");
  }

  const font = await fetch(match[1]).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load font file");
    }

    return response.arrayBuffer();
  });

  return font;
}
