import ModulePage from '../../../shared/components/ModulePage.jsx';

function SeriesPage() {
  return (
    <ModulePage
      eyebrow="Competition"
      title="Series"
      description="Manage series metadata, lifecycle states, and tournament level records."
      permission="series:manage"
      primaryAction="Create Series"
    />
  );
}

export default SeriesPage;
