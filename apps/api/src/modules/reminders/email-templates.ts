interface ReminderEmailInput {
  entityType: 'agreement' | 'licence';
  itemLabel: string;
  clientName: string | null;
  expiryDate: string;
  daysBefore: number;
}

export function buildReminderEmail({
  entityType,
  itemLabel,
  clientName,
  expiryDate,
  daysBefore,
}: ReminderEmailInput): { subject: string; html: string } {
  const kind = entityType === 'agreement' ? 'Agreement' : 'Licence';
  const subject = `${kind} expiring in ${daysBefore} day${daysBefore === 1 ? '' : 's'}: ${itemLabel}`;

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; color: #1f2937;">
      <h2 style="color: #4f46e5; margin-bottom: 4px;">AVS WB Management</h2>
      <p style="margin-top: 0;"><strong>${kind} expiring soon</strong></p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Item</td>
          <td style="padding: 4px 0;"><strong>${escapeHtml(itemLabel)}</strong></td>
        </tr>
        ${
          clientName
            ? `<tr><td style="padding: 4px 0; color: #6b7280;">Client</td><td style="padding: 4px 0;">${escapeHtml(clientName)}</td></tr>`
            : ''
        }
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Expiry date</td>
          <td style="padding: 4px 0;">${expiryDate}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Days remaining</td>
          <td style="padding: 4px 0;">${daysBefore}</td>
        </tr>
      </table>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
        Automated reminder from AVS WB Management. Log in to the app to view or renew this record.
      </p>
    </div>
  `;

  return { subject, html };
}

function escapeHtml(value: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (char) => map[char]);
}
