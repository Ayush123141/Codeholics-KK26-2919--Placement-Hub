async function testDuplicate() {
  const payload = {
    title: 'Full Stack Engineer (React / Node.js)',
    companyName: 'CloudScale Technologies',
    location: 'Bengaluru',
    description: 'Duplicate test posting description',
    sourceType: 'ALUMNI_REFERRAL',
    referrerName: 'Ankit Verma'
  };

  const res = await fetch('http://localhost:5000/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

testDuplicate();
