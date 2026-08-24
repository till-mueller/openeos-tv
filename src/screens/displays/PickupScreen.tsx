import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/common';
import { TVText } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useDisplaySocket } from '@/hooks/useDisplaySocket';
import { useDeviceStore, useDisplayStore } from '@/stores';
import { displayApi } from '@/lib/api-client';
import { TV_SIZES, DISPLAY_REFRESH_INTERVAL } from '@/constants';
import type { Order } from '@/types';

export const PickupScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { selectedEventId } = useDeviceStore();
  const { readyOrders, setReadyOrders } = useDisplayStore();

  // Connect to display socket
  useDisplaySocket();

  // Fetch ready orders
  const { data: fetchedOrders } = useQuery({
    queryKey: ['ready-orders', selectedEventId],
    queryFn: () => displayApi.getReadyOrders(selectedEventId || undefined),
    refetchInterval: DISPLAY_REFRESH_INTERVAL,
  });

  // Update store when data changes
  useEffect(() => {
    if (fetchedOrders) {
      setReadyOrders(fetchedOrders);
    }
  }, [fetchedOrders, setReadyOrders]);

  // Render large order number
  const renderOrderNumber = ({ item: order }: { item: Order }) => (
    <View
      style={[
        styles.orderCard,
        {
          backgroundColor: colors.success,
        },
      ]}>
      <TVText variant="h1" bold style={styles.orderNumber}>
        #{order.dailyNumber}
      </TVText>
      {order.tableNumber && (
        <TVText variant="h3" style={{ color: 'rgba(255,255,255,0.9)' }}>
          {t('delivery.tableNumber', { number: order.tableNumber })}
        </TVText>
      )}
      {/* No customer name here on purpose — this board is read by everyone
          in the venue, not just the customer it belongs to. The order
          number above (which the customer already has from their receipt)
          is enough to identify a pickup without putting a name on a public
          screen. */}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={t('pickup.title')} subtitle={t('pickup.ready')} />

      {readyOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <TVText variant="h2" color="muted" center>
            {t('pickup.noOrders')}
          </TVText>
        </View>
      ) : (
        <View style={styles.content}>
          <FlatList
            data={readyOrders}
            renderItem={renderOrderNumber}
            keyExtractor={order => order.id}
            numColumns={4}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.row}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: TV_SIZES.spacingXl,
  },
  gridContainer: {
    gap: TV_SIZES.gridGap,
  },
  row: {
    gap: TV_SIZES.gridGap,
  },
  orderCard: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: TV_SIZES.radiusXl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TV_SIZES.spacingLg,
    maxWidth: '23%',
    minHeight: 200,
  },
  orderNumber: {
    color: '#FFFFFF',
    fontSize: 80,
    lineHeight: 96,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
