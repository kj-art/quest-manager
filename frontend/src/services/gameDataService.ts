export async function fetchGameData(...sheetNames: string[]): Promise<Record<string, any[]>> {
  const query = sheetNames.map(name => `sheets=${encodeURIComponent(name)}`).join('&');
  const response = await fetch(`/api/data?${query}`);
  return await response.json();
}