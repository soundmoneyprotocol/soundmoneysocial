import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from './Card';
import Button from './Button';
import Loading from './Loading';
import { theme } from '../theme/theme';

export interface Payment {
  id: string;
  date: number;
  amount: number;
  status: string;
  currency: string;
  description: string;
  pdf_url?: string;
}

export interface BillingHistoryProps {
  limit?: number;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({
  limit = 10,
}) => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const accessToken = sessionStorage.getItem('soundmoney_access_token');

        if (!accessToken) {
          setPayments([]);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/payments/history?limit=${limit}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch payment history');
        }

        const data = await response.json();
        setPayments(data.payments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history');
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, offset, limit]);

  if (!user) {
    return (
      <Card>
        <p style={{ color: theme.colors.gray[400] }}>
          Please log in to view payment history
        </p>
      </Card>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Card>
        <p style={{ color: theme.colors.error }}>
          Error loading payment history: {error}
        </p>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <p style={{ color: theme.colors.gray[400] }}>
          No payment history available
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h3
        style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: theme.spacing.lg,
        }}
      >
        Payment History
      </h3>

      {/* Table */}
      <div
        style={{
          overflowX: 'auto',
          marginBottom: theme.spacing.lg,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: theme.spacing.md,
                  color: theme.colors.gray[400],
                  fontWeight: 'bold',
                }}
              >
                Date
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: theme.spacing.md,
                  color: theme.colors.gray[400],
                  fontWeight: 'bold',
                }}
              >
                Description
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: theme.spacing.md,
                  color: theme.colors.gray[400],
                  fontWeight: 'bold',
                }}
              >
                Amount
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: theme.spacing.md,
                  color: theme.colors.gray[400],
                  fontWeight: 'bold',
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: 'center',
                  padding: theme.spacing.md,
                  color: theme.colors.gray[400],
                  fontWeight: 'bold',
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const date = new Date(payment.date * 1000);
              const statusColor =
                payment.status === 'paid'
                  ? theme.colors.success
                  : payment.status === 'failed'
                    ? theme.colors.error
                    : theme.colors.gray[400];

              return (
                <tr
                  key={payment.id}
                  style={{
                    borderBottom: `1px solid ${theme.colors.gray[800]}`,
                  }}
                >
                  <td
                    style={{
                      padding: theme.spacing.md,
                      color: theme.colors.gray[200],
                    }}
                  >
                    {date.toLocaleDateString()}
                  </td>
                  <td
                    style={{
                      padding: theme.spacing.md,
                      color: theme.colors.gray[200],
                    }}
                  >
                    {payment.description}
                  </td>
                  <td
                    style={{
                      padding: theme.spacing.md,
                      textAlign: 'right',
                      color: theme.colors.primary,
                      fontWeight: 'bold',
                    }}
                  >
                    {payment.currency.toUpperCase()} ${(payment.amount / 100).toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: theme.spacing.md,
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        backgroundColor: `${statusColor}20`,
                        border: `1px solid ${statusColor}`,
                        borderRadius: theme.borderRadius.md,
                        color: statusColor,
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: theme.spacing.md,
                      textAlign: 'center',
                    }}
                  >
                    {payment.pdf_url && (
                      <a
                        href={payment.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: theme.colors.primary,
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '12px',
                        }}
                      >
                        View PDF
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: theme.spacing.md,
        }}
      >
        <span style={{ color: theme.colors.gray[400], fontSize: '14px' }}>
          Showing {payments.length} of {payments.length + offset}
        </span>
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset(offset + limit)}
            disabled={payments.length < limit}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BillingHistory;
