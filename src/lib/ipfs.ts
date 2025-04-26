
export async function uploadToIPFS(file: File): Promise<string> {
    return new Promise((resolve) => {
      
      setTimeout(() => {
        
        const fakeCID = `bafy${Math.random().toString(36).substring(2, 15)}`;
        console.log(`Файл "${file.name}" змокано завантажено з CID: ${fakeCID}`);
        resolve(fakeCID);
      }, 1000);
    });
  }
  