export default function AdminLoading() {
  return (
    <div style={{
      height: "calc(100vh - 100px)",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#000",
      color: "#fff",
      gap: "15px"
    }}>
      <div style={{ 
        width: "50px", 
        height: "50px", 
        border: "3px solid #333", 
        borderTop: "3px solid #fff", 
        borderRadius: "50%", 
        animation: "admin-spin 0.8s linear infinite" 
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes admin-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
      <span style={{ 
        fontFamily: "var(--font-arabic)", 
        fontWeight: 700,
        opacity: 0.8
      }}>
        جاري تهيئة لوحة التحكم...
      </span>
    </div>
  );
}
