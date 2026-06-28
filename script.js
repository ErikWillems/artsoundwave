const container = d3.select("#soundwave");

function createWave() {
  const width = container.node().clientWidth;

  // Approximate width per bar including gap
  const spacing = 10;

  // More screen width = more bars
  const bars = Math.floor(width / spacing);

  const pattern = d3.range(bars).map((_, i) => {
    const x = i / (bars - 1);

    const envelope =
      0.15 +
      0.85 *
        (Math.exp(-Math.pow((x - 0.25) / 0.06, 2)) +
          Math.exp(-Math.pow((x - 0.38) / 0.08, 2)) +
          Math.exp(-Math.pow((x - 0.54) / 0.07, 2)) +
          Math.exp(-Math.pow((x - 0.82) / 0.08, 2)));

    const pulse = 0.65 + 0.35 * Math.sin(i * 1.35);

    return Math.min(110, 8 + envelope * pulse * 65);
  });

  container
    .selectAll(".soundwave-bar")
    .data(pattern)
    .join("div")
    .attr("class", "soundwave-bar")
    .style("height", (d) => `${d}px`);
}

createWave();

window.addEventListener("resize", createWave);
