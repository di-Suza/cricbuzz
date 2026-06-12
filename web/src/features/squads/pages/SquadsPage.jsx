import ModulePage from '../../../shared/components/ModulePage.jsx';

function SquadsPage() {
  return (
    <ModulePage
      eyebrow="Selection"
      title="Squads"
      description="Attach players to team squads for a specific series or match context."
      permission="squads:manage"
      primaryAction="Manage Squad"
    />
  );
}

export default SquadsPage;
