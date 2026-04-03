import * as fs from 'fs';
import * as path from 'path';

async function run() {
  const token = 'test'; // You mentioned we can use the test token for the proxy
  
  console.log('Testing TwoPixel Proxy Nano Banana...');
  
  try {
    const response = await fetch('http://43.160.252.207:16686/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        model: 'nano-banana',
        prompt: 'A cute little cat playing with a ball of yarn, highly detailed, 4k',
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
      })
    });

    if (!response.ok) {
      console.error('❌ Failed:', response.status, await response.text());
      return;
    }

    const data = await response.json();
    const b64Data = data.data?.[0]?.b64_json;
    const imageUrl = data.data?.[0]?.url;

    if (b64Data) {
      const imageBuffer = Buffer.from(b64Data, 'base64');
      const filePath = path.join(__dirname, 'test-cat-proxy.png');
      fs.writeFileSync(filePath, imageBuffer);
      console.log(`✅ Success! Image generated via base64 and saved to: ${filePath}`);
    } else if (imageUrl) {
      console.log(`✅ Success! Image generated via URL: ${imageUrl}`);
    } else {
      console.log('❌ Failed: No image data or URL returned');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    console.error('❌ Request Error:', err.message);
  }
}

run();