"use strict";

import { create } from "ipfs-core";
import Hls from "hls.js";
import HlsjsIpfsLoader from "hlsjs-ipfs-loader";

document.addEventListener("DOMContentLoaded", async () => {
  const testHash = "Qma2JcVDGPdcFrHaw4Drw5TcTnX54HXuSakxHHkqKJvZu9";
  const repoPath = "ipfs-" + Math.random();
  const node = await create({ repo: repoPath });

  Hls.DefaultConfig.loader = HlsjsIpfsLoader;
  Hls.DefaultConfig.debug = false;
  if (Hls.isSupported()) {
    const video = document.getElementById("video");
    const status = document.getElementById("status");
    const hls = new Hls();
    hls.config.ipfs = node;
    hls.config.ipfsHash = testHash;
    hls.loadSource("index.m3u8");
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const node = document.createTextNode("Video ready...");
      status.appendChild(node);

      video.play();
    });
  }
});
