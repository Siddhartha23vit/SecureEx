import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY;

export const uploadToPinata = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      'Content-Type': `multipart/form-data;`,
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
  });

  return response.data.IpfsHash;
};

export const getFileUrl = (cid: string) => {
  return `${PINATA_GATEWAY}${cid}`;
};