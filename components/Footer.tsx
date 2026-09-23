import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Logo size={34} />
          <p>No thekedaar can ghost you.</p>
        </div>
        <div className="footer-note">Local Hardhat build · WageEscrow</div>
      </div>
    </footer>
  );
}
