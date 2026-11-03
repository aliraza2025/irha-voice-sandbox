"""Optional self-hosted LiveKit agent toolset. No paid provider is selected."""
from livekit.agents import Agent, function_tool

def quote(service: str, windows: int, stories: int = 1):
    catalog = {'exterior': (8,120), 'interior': (6,100), 'both': (13,180)}
    if service not in catalog or not 1 <= windows <= 200 or stories not in (1,2,3):
        raise ValueError('Invalid synthetic quote inputs')
    rate, floor = catalog[service]
    return {'amount': max(floor, windows * rate) + (0,35,75)[stories-1], 'currency': 'USD', 'stage': 'draft_only', 'source': 'fictional-catalog-v1'}

class SandboxReceptionist(Agent):
    def __init__(self):
        super().__init__(instructions='You are a sandbox receptionist. Ask for missing service scope, window count and stories. Use the quote tool. Never claim a real booking or send a message. Hand off complaints and human requests.')

    @function_tool()
    async def draft_quote(self, service: str, windows: int, stories: int = 1):
        """Calculate a fictional draft quote for review. No booking or external write."""
        return quote(service, windows, stories)

if __name__ == '__main__':
    import json
    agent = SandboxReceptionist()
    print(json.dumps({'agent_class':type(agent).__name__,'quote':quote('exterior',20,2),'transport':'Configure a self-hosted LiveKit session and local STT/LLM/TTS before a live room call.'}))
