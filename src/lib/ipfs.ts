export async function uploadToIPFS(file: File): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fakeCID = `bafy${Math.random().toString(36).substring(2, 15)}`;
      console.log(`File "${file.name}" mock uploaded with CID: ${fakeCID}`);
      resolve(fakeCID);
    }, 1000);
  });
}
  