import ModulePage from '../../../shared/components/ModulePage.jsx';

function CommentaryPage() {
  return (
    <ModulePage
      eyebrow="Live"
      title="Commentary"
      description="Publish and manage ball commentary for live match coverage."
      permission="commentary:manage"
      primaryAction="Add Commentary"
    />
  );
}

export default CommentaryPage;
