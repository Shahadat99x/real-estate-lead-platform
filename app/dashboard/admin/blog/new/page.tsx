import { PostForm } from '../_components/post-form';
import { requireRole } from '@/lib/authz';

export default async function NewPostPage() {
    await requireRole(['admin']);

    return (
        <div className="space-y-6">
            <PostForm isNew />
        </div>
    );
}
