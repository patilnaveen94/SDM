import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { academyCourses } from '../config/assetsConfig';
import { SectionHeader } from '../components/SectionHeader';
import { GoldButton } from '../components/GoldButton';

interface QueryForm {
  name: string;
  email: string;
  phone: string;
  courseId: string;
  message: string;
}

export const AcademyScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<QueryForm>({
    name: '',
    email: '',
    phone: '',
    courseId: '',
    message: '',
  });
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const validateAndSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (!form.phone.match(/^\d{10}$/)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (!form.message.trim()) {
      Alert.alert('Validation Error', 'Please enter your query message.');
      return;
    }

    Alert.alert(
      'Query Submitted! ✅',
      'Thank you for your interest. Our team will reach out within 24 hours.',
      [{ text: 'OK' }]
    );
    setForm({ name: '', email: '', phone: '', courseId: '', message: '' });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SectionHeader
          title="SDM Academy"
          goldWord="Academy"
          subtitle="Master the art of visual storytelling"
        />

        {/* Course Cards */}
        {academyCourses.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={styles.courseCard}
            activeOpacity={0.8}
            onPress={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
          >
            <Image
              source={{ uri: course.image }}
              style={styles.courseImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.courseOverlay}>
              <View style={styles.courseBadges}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelText}>{course.level}</Text>
                </View>
                <View style={styles.durationBadge}>
                  <Feather name="clock" size={10} color="#A0A0A0" />
                  <Text style={styles.durationText}>{course.duration}</Text>
                </View>
              </View>
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseDesc} numberOfLines={2}>{course.description}</Text>

              <View style={styles.courseStats}>
                <View style={styles.statItem}>
                  <Feather name="star" size={12} color="#D4AF37" />
                  <Text style={styles.statText}>{course.rating}</Text>
                </View>
                <View style={styles.statItem}>
                  <Feather name="users" size={12} color="#666" />
                  <Text style={styles.statText}>{course.enrolledCount} students</Text>
                </View>
                <Text style={styles.coursePrice}>₹{course.price.toLocaleString()}</Text>
              </View>

              {/* Expanded Syllabus */}
              {selectedCourse === course.id && (
                <View style={styles.syllabus}>
                  <Text style={styles.syllabusTitle}>Syllabus</Text>
                  {course.syllabus.map((item, idx) => (
                    <View key={idx} style={styles.syllabusItem}>
                      <View style={styles.syllabusDot} />
                      <Text style={styles.syllabusText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Query Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Student Query Portal</Text>
          <Text style={styles.formSubtitle}>
            Have questions? We'll respond within 24 hours.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your Full Name"
            placeholderTextColor="#666"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#666"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number (10 digits)"
            placeholderTextColor="#666"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
            maxLength={10}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your question or message..."
            placeholderTextColor="#666"
            value={form.message}
            onChangeText={(text) => setForm({ ...form, message: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <GoldButton title="Submit Query" onPress={validateAndSubmit} size="lg" style={{ marginTop: 8 }} />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  courseCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    justifyContent: 'flex-start',
    padding: 12,
  },
  courseBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0A0A0A',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10,10,10,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 10,
    color: '#A0A0A0',
    fontWeight: '600',
  },
  courseInfo: {
    padding: 14,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F5F5F5',
  },
  courseDesc: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 4,
    lineHeight: 17,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#A0A0A0',
    fontWeight: '600',
  },
  coursePrice: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: '800',
    color: '#D4AF37',
  },
  syllabus: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  syllabusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
  },
  syllabusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  syllabusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
    marginTop: 5,
  },
  syllabusText: {
    fontSize: 12,
    color: '#C0C0C0',
    flex: 1,
    lineHeight: 16,
  },
  formSection: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#D4AF37',
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 12,
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
