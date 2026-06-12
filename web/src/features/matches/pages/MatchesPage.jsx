import ModulePage from '../../../shared/components/ModulePage.jsx';

function MatchesPage() {
  return (
    <ModulePage
      eyebrow="Operations"
      title="Matches"
      description="Control match lifecycle, fixtures, toss details, venues, and live states."
      permission="matches:manage"
      primaryAction="Create Match"
    />
  );
}

export default MatchesPage;
