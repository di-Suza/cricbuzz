import ModulePage from '../../../shared/components/ModulePage.jsx';

function PlayingXiPage() {
  return (
    <ModulePage
      eyebrow="Match setup"
      title="Playing XI"
      description="Select match lineups and keep XI data available for live score workflows."
      permission="playingXi:manage"
      primaryAction="Set XI"
    />
  );
}

export default PlayingXiPage;
