export async function fetchGameData(...sheetNames: string[]): Promise<Record<string, any[]>> {
  const query = sheetNames.map(name => `sheets=${encodeURIComponent(name)}`).join('&');
  const response = await fetch(`/api/data?${query}`);
  return await response.json();
}

export async function saveGameData(sheetName: string, records: any[]): Promise<any> {
  const response = await fetch(`/api/data/${encodeURIComponent(sheetName)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(records)
  });

  if (!response.ok) {
    throw new Error(`Failed to save data to sheet '${sheetName}': ${response.statusText}`);
  }

  return await response.json();
}
