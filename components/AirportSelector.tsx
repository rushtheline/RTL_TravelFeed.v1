import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, Plane } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface AirportSelectorProps {
  selectedAirportId?: string;
  onSelectAirport: (airport: Airport) => void;
}

export const AirportSelector: React.FC<AirportSelectorProps> = ({
  selectedAirportId,
  onSelectAirport,
}) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAirports();
  }, []);

  useEffect(() => {
    if (selectedAirportId && airports.length > 0) {
      const airport = airports.find((a) => a.id === selectedAirportId);
      if (airport) {
        setSelectedAirport(airport);
      }
    }
  }, [selectedAirportId, airports]);

  const fetchAirports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('airports')
        .select('*')
        .order('code');

      if (error) throw error;
      setAirports(data || []);
    } catch (error) {
      console.error('Error fetching airports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAirport = (airport: Airport) => {
    setSelectedAirport(airport);
    onSelectAirport(airport);
    setModalVisible(false);
  };

  const renderAirportItem = ({ item }: { item: Airport }) => (
    <TouchableOpacity
      style={[
        styles.airportItem,
        selectedAirport?.id === item.id && styles.airportItemSelected,
      ]}
      onPress={() => handleSelectAirport(item)}
    >
      <View style={styles.airportItemLeft}>
        <View style={styles.codeContainer}>
          <Text style={styles.airportCode}>{item.code}</Text>
        </View>
        <View style={styles.airportItemContent}>
          <Text style={styles.airportItemName}>{item.name}</Text>
          <Text style={styles.airportItemCity}>
            {item.city}, {item.country}
          </Text>
        </View>
      </View>
      {selectedAirport?.id === item.id && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <View style={styles.selectorLeft}>
            <Plane size={20} color={colors.primary} />
            <View style={styles.selectorText}>
              <Text style={styles.airportName}>
                {selectedAirport?.code || 'Select Airport'}
              </Text>
              {selectedAirport && (
                <Text style={styles.cityName}>
                  {selectedAirport.city}
                </Text>
              )}
            </View>
          </View>
          <ChevronDown size={20} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Airport</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={airports}
              keyExtractor={(item) => item.id}
              renderItem={renderAirportItem}
              contentContainerStyle={styles.airportList}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  selector: {
    backgroundColor: colors.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    minHeight: 48,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  selectorText: {
    flex: 1,
  },
  airportName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  cityName: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: typography.sizes.xl,
    color: colors.text.secondary,
  },
  airportList: {
    padding: spacing.md,
  },
  airportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    padding: spacing.md,
    borderRadius: borderRadius.base,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  airportItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`,
  },
  airportItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  codeContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  airportCode: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  airportItemContent: {
    flex: 1,
  },
  airportItemName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  airportItemCity: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
