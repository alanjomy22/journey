import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import RemixIcon from 'react-native-remix-icon';

const { width } = Dimensions.get('window');

interface InsightItem {
  id: string;
  title: string;
  icon: 'key-line' | 'heart-line' | 'plant-line' | 'emotion-line';
  isExpanded: boolean;
  content?: string[];
}

export default function AnalyticsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('Weeks');
  const [insights, setInsights] = useState<InsightItem[]>([
    {
      id: '1',
      title: 'Key Themes',
      icon: 'key-line',
      isExpanded: false,
      content: ['Personal Growth', 'Mindfulness', 'Relationships', 'Career Development']
    },
    {
      id: '2',
      title: 'Relationships',
      icon: 'heart-line',
      isExpanded: false,
      content: ['Family bonds strengthening', 'New friendships forming', 'Professional networking']
    },
    {
      id: '3',
      title: 'Growth Opportunities',
      icon: 'plant-line',
      isExpanded: false,
      content: ['Learning new skills', 'Expanding comfort zone', 'Building confidence']
    },
    {
      id: '4',
      title: 'Mood & Sentiments',
      icon: 'emotion-line',
      isExpanded: false,
      content: ['Overall positive trend', 'Increased gratitude', 'Better emotional regulation']
    },
  ]);

  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [3.2, 3.8, 4.1, 3.9, 4.3, 4.0, 4.2],
        color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const currentDay = 3; // Wednesday

  const toggleInsight = (id: string) => {
    setInsights(prev =>
      prev.map(insight =>
        insight.id === id
          ? { ...insight, isExpanded: !insight.isExpanded }
          : insight
      )
    );
  };

  const renderInsightCard = (insight: InsightItem) => (
    <View key={insight.id} style={styles.insightCard}>
      <TouchableOpacity
        style={styles.insightHeader}
        onPress={() => toggleInsight(insight.id)}
        activeOpacity={0.7}
      >
        <View style={styles.insightTitleContainer}>
          <RemixIcon name={insight.icon} size={20} color="#8B5CF6" />
          <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
        </View>
        <RemixIcon
          name={insight.isExpanded ? 'arrow-up-s-line' : 'arrow-down-s-line'}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
      
      {insight.isExpanded && insight.content && (
        <View style={styles.insightContent}>
          {insight.content.map((item, index) => (
            <Text key={index} style={styles.insightItem}>
              • {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const additionalInsights = [
    { title: 'Gratification', subtitle: 'Can', color: '#FF6B6B' },
    { title: 'Confidence', subtitle: '', color: '#4ECDC4' },
    { title: 'Spiritual', subtitle: '', color: '#45B7D1' },
    { title: 'Hope', subtitle: 'Hope', color: '#96CEB4' },
    { title: 'Hope', subtitle: 'Hope', color: '#FECA57' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <RemixIcon name="arrow-left-line" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.periodSelector}
            onPress={() => {
              // Toggle between different periods
              setSelectedPeriod(prev => 
                prev === 'Weeks' ? 'Months' : prev === 'Months' ? 'Years' : 'Weeks'
              );
            }}
          >
            <Text style={styles.periodText}>{selectedPeriod}</Text>
            <RemixIcon name="arrow-down-s-line" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.mainTitle}>Reflective Joy Seeker</ThemedText>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={width - 40}
            height={120}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '0',
              },
              propsForLabels: {
                fontSize: 12,
              },
            }}
            bezier
            style={styles.chart}
            withHorizontalLabels={false}
            withVerticalLabels={false}
            withDots={false}
          />
          <Text style={styles.averageLabel}>Average</Text>
        </View>

        {/* Week Calendar */}
        <View style={styles.weekContainer}>
          <View style={styles.weekDays}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text style={[
                  styles.dayText,
                  index === currentDay && styles.currentDayText
                ]}>
                  {day}
                </Text>
                {index === currentDay && <View style={styles.currentDayIndicator} />}
              </View>
            ))}
          </View>
          
          <View style={styles.weekLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
              <Text style={styles.legendText}>This week</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E0E0' }]} />
              <Text style={styles.legendText}>Past week</Text>
            </View>
          </View>
        </View>

        {/* Week Navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity>
            <RemixIcon name="arrow-left-s-line" size={24} color="#666" />
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekDate}>22 Sep - 28 Sep</Text>
            <Text style={styles.weekTitle}>This week</Text>
          </View>
          <TouchableOpacity>
            <RemixIcon name="arrow-right-s-line" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* AI Insights Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>AI INSIGHTS</ThemedText>
          {insights.map(renderInsightCard)}
        </View>

        {/* Emotional Insights */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>EMOTIONAL INSIGHTS</ThemedText>
          <View style={styles.emotionalInsightsContainer}>
            <View style={styles.additionalInsightsGrid}>
              {additionalInsights.map((item, index) => (
                <TouchableOpacity key={index} style={[styles.additionalInsightCard, { backgroundColor: item.color }]} activeOpacity={0.8}>
                  <Text style={styles.additionalInsightTitle}>{item.title}</Text>
                  {item.subtitle ? (
                    <Text style={styles.additionalInsightSubtitle}>{item.subtitle}</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.insightDescriptionContainer}>
              <View style={styles.insightDescriptionCard}>
                <RemixIcon name="lightbulb-line" size={20} color="#8B5CF6" />
                <Text style={styles.insightDescription}>
                  Daily reflection can build meaning
                </Text>
              </View>
              <View style={styles.insightDescriptionCard}>
                <RemixIcon name="arrow-up-line" size={20} color="#10B981" />
                <Text style={styles.insightDescription}>
                  Meaning has been strong
                </Text>
              </View>
              <View style={styles.insightDescriptionCard}>
                <RemixIcon name="star-line" size={20} color="#F59E0B" />
                <Text style={styles.insightDescription}>
                  Meaning is important to you
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  periodText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  chart: {
    borderRadius: 16,
  },
  averageLabel: {
    position: 'absolute',
    top: 20,
    right: 40,
    fontSize: 12,
    color: '#666',
  },
  weekContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayContainer: {
    alignItems: 'center',
    width: 30,
  },
  dayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  currentDayText: {
    color: '#333',
    fontWeight: '600',
  },
  currentDayIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFC107',
  },
  weekLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  weekInfo: {
    alignItems: 'center',
  },
  weekDate: {
    color: '#666',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  insightTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  insightContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FAFAFA',
  },
  insightItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  emotionalInsightsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  additionalInsightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  additionalInsightCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 90,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  additionalInsightTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  additionalInsightSubtitle: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.8,
  },
  insightDescriptionContainer: {
    gap: 12,
  },
  insightDescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  insightDescription: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
});
