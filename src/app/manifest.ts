import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "quadrembranco",
    short_name: "qb",
    description: "cole qualquer coisa. seu feed visual sem fronteiras.",
    start_url: "/",
    display: "standalone",
    background_color: "#07060d",
    theme_color: "#b48cff",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
