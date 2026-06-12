import ModulePage from '../../../shared/components/ModulePage.jsx';

function ScoringPage() {
  return (
    <ModulePage
      eyebrow="Live"
      title="Scoring"
      description="Run ball by ball score updates for active matches through protected scorer tools."
      permission="score:manage"
      primaryAction="Open Scorer"
    />
  );
}

export default ScoringPage;
