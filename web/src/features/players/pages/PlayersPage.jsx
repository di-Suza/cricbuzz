import ModulePage from '../../../shared/components/ModulePage.jsx';

function PlayersPage() {
  return (
    <ModulePage
      eyebrow="Catalogue"
      title="Players"
      description="Manage global player records used across teams, squads, and match lineups."
      permission="players:manage"
      primaryAction="Create Player"
    />
  );
}

export default PlayersPage;
