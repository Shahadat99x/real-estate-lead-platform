import { ReactNode } from 'react';
import clsx from 'clsx';
import { Card, CardBody, CardHeader } from './card';

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Responsive table wrapper: adds card shell + horizontal scroll on mobile.
 */
export function TableCard({ title, subtitle, children, className }: Props) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} />
      <CardBody>
        <div className={clsx('overflow-x-auto')}>
          <div className="min-w-full">{children}</div>
        </div>
      </CardBody>
    </Card>
  );
}
