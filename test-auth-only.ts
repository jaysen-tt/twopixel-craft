async function run() {
  const loginRes = await fetch('http://43.160.252.207:16686/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: '784304770@qq.com',
      password: '12345678'
    })
  });
  const data = await loginRes.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
