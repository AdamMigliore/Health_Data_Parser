function to_time(ms: number) {
  const ms_ = Math.floor(ms % 1000);
  const s = Math.floor((ms / 1000) % 60);
  const m = Math.floor((ms / 1000 / 60) % 60);

  return `${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}.${ms_.toString().padEnd(3, "0")}`;
}

export { to_time };
