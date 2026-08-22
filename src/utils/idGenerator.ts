/**
 * Generates automated enterprise Login ID based on formula:
 * [Company Code (2)][First 2 letters of First & Last Name][Year (4)][Serial (4)]
 * Example: Odoo India + John Doe + 2026 + 0001 -> OIJODO20260001
 */
export function generateLoginId(
  companyName: string,
  fullName: string,
  year: number = new Date().getFullYear(),
  serialNumber: number = 1
): string {
  // 1. Company Code (2 chars uppercase)
  const cleanCompany = (companyName || 'DAYFLOW').trim().toUpperCase().replace(/[^A-Z0-9]/g, ' ');
  const compWords = cleanCompany.split(/\s+/).filter(Boolean);
  let companyCode = 'DF';
  if (compWords.length >= 2) {
    companyCode = (compWords[0][0] + compWords[1][0]).toUpperCase();
  } else if (compWords.length === 1 && compWords[0].length >= 2) {
    companyCode = compWords[0].slice(0, 2).toUpperCase();
  } else if (compWords.length === 1) {
    companyCode = (compWords[0][0] + 'X').toUpperCase();
  }

  // 2. First 2 letters of First Name + First 2 letters of Last Name
  const cleanName = (fullName || 'John Doe').trim().toUpperCase().replace(/[^A-Z]/g, ' ');
  const nameParts = cleanName.split(/\s+/).filter(Boolean);
  let nameCode = 'JODO';
  if (nameParts.length >= 2) {
    const firstPart = (nameParts[0] + 'XX').slice(0, 2);
    const lastPart = (nameParts[nameParts.length - 1] + 'XX').slice(0, 2);
    nameCode = firstPart + lastPart;
  } else if (nameParts.length === 1) {
    const part = (nameParts[0] + 'XXXX').slice(0, 4);
    nameCode = part;
  }

  // 3. Year (4 digits)
  const yearCode = String(year).padStart(4, '2026');

  // 4. Serial (4 digits padded)
  const serialCode = String(serialNumber).padStart(4, '0');

  return `${companyCode}${nameCode}${yearCode}${serialCode}`;
}
