export default function Loading() {
  return (
    <div style={{
      height: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--offwhite)",
      gap: "20px"
    }}>
      <div style={{
        width: "60px",
        height: "60px",
        border: "5px solid rgba(245,197,24,0.1)",
        borderTop: "5px solid var(--gold)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
      <h2 style={{
        fontFamily: "var(--font-arabic)",
        fontWeight: 800,
        color: "var(--black)",
        fontSize: "1.25rem"
      }}>
        جاري التحميل...
      </h2>
    </div>
  );
}
