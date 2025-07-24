"use client";

import React, { useState } from "react";
import LandingClient from "@/components/LandingClient";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-hidden">
      <LandingClient />
    </div>
  );
}