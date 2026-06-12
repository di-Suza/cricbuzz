import ModulePage from '../../../shared/components/ModulePage.jsx';

function TeamsPage() {
  return (
    <ModulePage
      eyebrow="Catalogue"
      title="Teams"
      description="Maintain team profiles, short names, countries, and squad ownership."
      permission="teams:manage"
      primaryAction="Create Team"
    />
  );
}

export default TeamsPage;
