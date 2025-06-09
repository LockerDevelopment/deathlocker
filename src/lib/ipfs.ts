export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({
    name: file.name,
    keyvalues: {
      originalType: file.type,
      encrypted: true
    }
  }));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload to IPFS');
  }

  const result = await response.json();
  return result.IpfsHash;
}
  