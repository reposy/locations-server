// 파일 경로: /js/service/invitationService.js
import { store } from '../user/store.js';

export async function loadInvitations() {
    try {
        const response = await fetch(`/api/user-invitations/received`, {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error("초대 목록을 불러오지 못했습니다.");
        }
        const invitations = await response.json();
        // store에 초대 목록 저장 (store.state.invitations)
        store.setState({ invitations });
        return invitations;
    } catch (error) {
        console.error("Error loading invitations:", error);
        throw error;
    }
}