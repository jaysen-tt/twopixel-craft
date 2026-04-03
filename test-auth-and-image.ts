import * as fs from 'fs';
import * as path from 'path';

async function run() {
  console.log('1. Logging in to get real JWT token...');
  const loginRes = await fetch('http://43.160.252.207:16686/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: '784304770@qq.com',
      password: '12345678'
    })
  });

  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, await loginRes.text());
    // Try with 'email' field just in case
    console.log('Trying with email field...');
    const loginRes2 = await fetch('http://43.160.252.207:16686/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: '784304770@qq.com',
        password: '12345678'
      })
    });
    if (!loginRes2.ok) {
      console.error('Login failed again:', loginRes2.status, await loginRes2.text());
      return;
    }
    const loginData2 = await loginRes2.json();
    await testImageGen(loginData2.access_token);
    return;
  }

  const loginData = await loginRes.json();
  console.log('✅ Login successful!');
  
  // The backend returns the token in the 'token' field, not 'access_token'
  await testImageGen(loginData.token);
}

async function testImageGen(token: string) {
  console.log('2. Testing TwoPixel Proxy Nano Banana with real token...');
  
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

    if (b64Data) {
      const imageBuffer = Buffer.from(b64Data, 'base64');
      const filePath = path.join(__dirname, 'test-cat-proxy-real.png');
      fs.writeFileSync(filePath, imageBuffer);
      console.log(`✅ Success! Image generated via base64 and saved to: ${filePath}`);
    } else {
      console.log('❌ Failed: No image data returned');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    console.error('❌ Request Error:', err.message);
  }
}

run();