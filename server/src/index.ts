import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[ProofHire] Server running on port ${PORT}`);
  console.log(`[ProofHire] Health check available at http://localhost:${PORT}/health`);
});
