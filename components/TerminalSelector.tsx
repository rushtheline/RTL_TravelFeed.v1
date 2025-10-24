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
import { ChevronDown, MapPin } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { supabase } from '../lib/supabase';

interface Terminal {
  id: string;
  name: string;
  code: string;
  gate_range: string | null;
  airport_id: string;
}

interface TerminalSelectorProps {
  airportId: string;
  selectedTerminalId?: string;
  onSelectTerminal: (terminal: Terminal) => void;
}

export const TerminalSelector: React.FC<TerminalSelectorProps> = ({
  airportId,
  selectedTerminalId,
  onSelectTerminal,
}) => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerminals();
  }, [airportId]);

  useEffect(() => {
    if (selectedTerminalId && terminals.length > 0) {
      const terminal = terminals.find((t) => t.id === selectedTerminalId);
      if (terminal) {
        setSelectedTerminal(terminal);
      }
    }
  }, [selectedTerminalId, terminals]);

  const fetchTerminals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .eq('airport_id', airportId)
        .order('code');

      if (error) throw error;
      setTerminals(data || []);
    } catch (error) {
      console.error('Error fetching terminals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTerminal = (terminal: Terminal) => {
    setSelectedTerminal(terminal);
    onSelectTerminal(terminal);
    setModalVisible(false);
  };

  const renderTerminalItem = ({ item }: { item: Terminal }) => (
    <TouchableOpacity
      style={[
        styles.terminalItem,
        selectedTerminal?.id === item.id && styles.terminalItemSelected,
      ]}
      onPress={() => handleSelectTerminal(item)}
    >
      <View style={styles.terminalItemContent}>
        <Text style={styles.terminalItemName}>{item.name}</Text>
        {item.gate_range && (
          <Text style={styles.terminalItemGates}>{item.gate_range}</Text>
        )}
      </View>
      {selectedTerminal?.id === item.id && (
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
          <Text style={styles.terminalName}>
            {selectedTerminal?.name || 'Select Terminal'}
          </Text>
          {selectedTerminal?.gate_range && (
            <Text style={styles.gateRange}>{selectedTerminal.gate_range}</Text>
          )}
        </View>
        <ChevronDown size={20} color={colors.text.secondary} />
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
              <Text style={styles.modalTitle}>Select Terminal</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={terminals}
              keyExtractor={(item) => item.id}
              renderItem={renderTerminalItem}
              contentContainerStyle={styles.terminalList}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
  },
  selectorContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    
  },
  terminalName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  gateRange: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  terminalList: {
    padding: spacing.md,
  },
  terminalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  terminalItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}15`,
  },
  terminalItemContent: {
    flex: 1,
  },
  terminalItemName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  terminalItemGates: {
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
