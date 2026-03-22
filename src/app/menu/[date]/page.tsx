import { redirect } from 'next/navigation';

export default function MenuDatePage({ params }: { params: Promise<{ date: string }> }) {
  // For now, redirect to main menu page
  // In production, this would load date-specific menu
  void params;
  redirect('/menu');
}
