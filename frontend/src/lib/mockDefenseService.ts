export function mockSaveDefense(data: {
  stage: string;
  date: string;
  time: string;
  panel: string[];
}): Promise<void> {
  console.log("Mock saving defense:", data);
  return new Promise((res) => setTimeout(res, 1000)); // delays 1s
}
