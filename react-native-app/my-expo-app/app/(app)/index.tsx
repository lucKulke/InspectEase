import {
  View,
  Alert,
  FlatList,
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { DBActionsFormFillerFetch } from '@/lib/db/form-filler/fetch';
import { IFillableFormPlusFillableFields } from '@/lib/db/form-filler/interfaces';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useUser } from '@/lib/context/user-context';
import { Redirect, router, Stack } from 'expo-router';
import { DBActionsPublicFetch } from '@/lib/db/public/fetch';
import { IUserProfileResponse } from '@/lib/db/public/interfaces';
import { DBActionsBucket } from '@/lib/db/bucket';
import { BOTTOM_BAR_HEIGHT } from '@/components/BottomBar';
import { useFilters } from '@/lib/context/filter-context';
import FormCard from '@/components/FromCard';
import { useTeam } from '@/lib/context/team-context';

import {
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '@/components/Avatar';

export default function Home() {
  const user = useUser();
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanningEnabled, setScanningEnabled] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const lastHitRef = useRef<{ data: string; ts: number } | null>(null);

  if (!user) return <Redirect href="/login" />;

  //  accept teamId so we always fetch the right set

  // initial loa

  const getFormId = async (code: string) => {
    const formFillerFetch = new DBActionsFormFillerFetch(supabase);
    // If your fetcher doesn’t support teamId yet, add it there and pass through.
    const { forms, formsError } = await formFillerFetch.fetchAllForms();
    if (formsError) {
      Alert.alert('Fetch forms failed', formsError.message);
      return;
    }
    if (!forms) {
      Alert.alert('No forms found');
      return;
    }
    console.log('forms:', forms);
    const formId = forms.filter((f) => {
      return f.identifier_string === code;
    })[0]?.id;

    return formId;
  };

  const handleUseCode = useCallback(async (code: string) => {
    console.log('submitting code:', code);
    const formId = await getFormId(code);

    if (!formId) return;

    router.push(`/form/${formId}`);
  }, []);

  const openScanner = async () => {
    if (!permission || !permission.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Camera permission needed',
          'Enable camera access in Settings to scan QR codes.'
        );
        return;
      }
    }
    setShowScanner(true);
    setScanningEnabled(true); // enable when the modal appears
  };

  const onScan = useCallback(
    async ({ data }: { data: string }) => {
      // Immediately disable further scans before any state updates/alerts
      setScanningEnabled(false);

      // Dedupe same payload within 1200ms (belt & suspenders)
      const now = Date.now();
      if (
        lastHitRef.current &&
        lastHitRef.current.data === data &&
        now - lastHitRef.current.ts < 1200
      ) {
        return;
      }
      lastHitRef.current = { data, ts: now };

      // Close camera first (unmounts CameraView soon)
      setShowScanner(false);

      // Then handle the code
      const trimmed = String(data ?? '').trim();
      if (trimmed) {
        const formId = await getFormId(trimmed);
        if (formId) {
          router.push(`/form/${formId}`);
        }
      }
    },
    [setManualCode]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'InspectEase', headerRight: () => <Avatar /> }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        {/* Press anywhere outside inputs to dismiss */}
        <Pressable className="flex-1" onPress={Keyboard.dismiss}>
          <ScrollView
            keyboardDismissMode="on-drag" // dismiss when you drag the content
            keyboardShouldPersistTaps="handled" // let taps pass through to buttons, then dismiss
            contentContainerClassName="flex-grow"
            className="flex-1 bg-white px-5">
            <View className="flex-1 bg-white px-5">
              <View className="mt-5 flex items-center">
                <TouchableOpacity
                  onPress={openScanner}
                  className="h-72 w-72 items-center justify-center rounded-2xl bg-black/90"
                  accessibilityRole="button"
                  accessibilityLabel="Open QR Scanner">
                  <Ionicons name="qr-code-outline" size={150} color="white" />
                </TouchableOpacity>
              </View>

              {/* Manual fallback */}
              <View className="mt-5">
                <Text className="mb-2 text-base text-gray-600">Or enter a code manually:</Text>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={manualCode}
                    onChangeText={setManualCode}
                    placeholder="Paste or type code"
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 rounded-2xl border border-gray-300 px-4 py-3 pb-5 text-xl"
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      handleUseCode(manualCode);
                    }}
                    className="rounded-2xl bg-black/90 p-5">
                    <Text className="font-medium text-white">Use</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scanner modal */}
              <Modal
                visible={showScanner}
                animationType="slide"
                onRequestClose={() => {
                  setScanningEnabled(false);
                  setShowScanner(false);
                }}
                onShow={() => setScanningEnabled(true)} // re-enable when shown
              >
                <View className="flex-1 bg-black">
                  <View className="absolute right-4 top-12 z-10">
                    <TouchableOpacity
                      onPress={() => {
                        setScanningEnabled(false);
                        setShowScanner(false);
                      }}
                      className="rounded-full bg-white/90 p-3"
                      accessibilityRole="button"
                      accessibilityLabel="Close scanner">
                      <Ionicons name="close" size={20} color="black" />
                    </TouchableOpacity>
                  </View>

                  <CameraView
                    className="flex-1"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    // Only attach the handler while scanningEnabled is true
                    onBarcodeScanned={scanningEnabled ? onScan : undefined}
                  />

                  <View className="absolute bottom-10 left-0 right-0 items-center">
                    <Text className="rounded-full bg-black/60 px-4 py-2 text-base text-white">
                      Point the camera at a QR code
                    </Text>
                  </View>
                </View>
              </Modal>
            </View>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </>
  );
}
