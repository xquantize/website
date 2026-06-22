"use client";

import { useEffect } from "react";

export default function PlaygroundRedirect() {
  useEffect(() => {
    window.location.replace("/#work-01");
  }, []);

  return null;
}
