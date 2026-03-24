import { Mail, Shield } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <h3 className="font-orbitron text-lg font-bold">
              <span className="text-primary">mind</span>
              <span className="text-foreground">care</span>
              <span className="text-primary">X</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your Mental Wellness, Our Priority. Connecting patients with qualified professionals for accessible mental healthcare.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Video Consultations</li>
              <li>Chat Sessions</li>
              <li>Appointment Booking</li>
              <li>Session Reports</li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Privacy Policy
              </li>
              <li>Terms of Service</li>
              <li>Data Protection</li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Support</h4>
            <a
              href="mailto:minorprojectcsd@gmail.com"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Mail className="h-4 w-4" />
              support.mindcarex
            </a>
            <p className="text-xs text-muted-foreground">
              Reach out for any queries or assistance.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>&copy; {currentYear} mindcareX. All rights reserved.</p>
          <p>Built for mental wellness</p>
        </div>
      </div>
    </footer>
  );
}
