"use client";

import { useEffect } from "react";
import { parseDesign, setDesign, useDesign } from "../model/design";

/** Ставит `data-design` на <html> — по нему переключаются токены и шрифты. `?design=` в адресе запоминает вариант. */
export function DesignSync() {
  const design = useDesign();

  useEffect(() => {
    const fromUrl = parseDesign(
      new URLSearchParams(window.location.search).get("design"),
    );
    if (fromUrl) setDesign(fromUrl);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.design = design;
  }, [design]);

  return null;
}
