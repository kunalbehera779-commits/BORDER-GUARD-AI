from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any


@dataclass(frozen=True)
class EnvironmentContext:
    daylight: bool = True
    night: bool = False
    low_light: bool = False
    fog: bool = False
    rain: bool = False
    dust_haze: bool = False
    visibility_level: str = "normal"

    @property
    def confidence_factor(self) -> float:
        if self.visibility_level == "low" or self.low_light or self.fog or self.dust_haze:
            return 0.85
        if self.rain:
            return 0.9
        return 1.0

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)
