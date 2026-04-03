async function run() {
  const apiKey = 'test'; // Use the test token you mentioned
  const response = await fetch('http://43.160.252.207:16686/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'nano-banana',
      prompt: 'A cute little cat playing with a ball of yarn, highly detailed, 4k',
      n: 1,
      size: '1024x1024'
    })
  });

  if (!response.ok) {
    console.error('Failed:', response.status, await response.text());
    return;
  }

  const data = await response.json();
  console.log('Success! Response:', JSON.stringify(data, null, 2));
}

run();
